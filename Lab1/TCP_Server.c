/* This code is based on a concutent TCP server example.
  Original code author: Lenuta Alboaie  <adria@infoiasi.ro> (c)2009
*/
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <errno.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <signal.h>
#include <fcntl.h>

#define PORT 2024

extern int errno;

void cl_msg_rec(int client)
{
  char msg[900]; // mesajul primit de la client
  while (1)
  {
    bzero(msg, 900);
    printf("[server-client]Asteptam mesajul...\n");
    fflush(stdout);

    if (read(client, msg, 900) <= 0)
    {
      perror("[server-client]Eroare la read() de la client.\n");
      close(client);
      exit(1);
      continue;
    }
    if (strcmp(msg, "quit\n") == 0)
    {
      printf("[server-Earth]Mesajul a fost receptionat...%s\n", msg);
      bzero(msg, 900);
      close(client);
      break;
    }
    printf("[server-client]Mesajul a fost receptionat...%s\n", msg);
    bzero(msg, 900);
  }
}

void sig_wait(int sig)
{
  wait(1);
}

int main()
{
  struct sockaddr_in server;
  struct sockaddr_in from;

  int sd;
  int optval = 1;

  /* crearea unui socket */
  if ((sd = socket(AF_INET, SOCK_STREAM, 0)) == -1)
  {
    perror("[server]Eroare la client socket().\n");
    return errno;
  }

  /*setam pentru socket optiunea SO_REUSEADDR */
  setsockopt(sd, SOL_SOCKET, SO_REUSEADDR, &optval, sizeof(optval));

  /* pregatirea structurilor de date */
  bzero(&server, sizeof(server));
  bzero(&from, sizeof(from));

  /* umplem structura folosita de server */
  /* stabilirea familiei de socket-uri */
  server.sin_family = AF_INET;
  /* acceptam orice adresa */
  server.sin_addr.s_addr = htonl(INADDR_ANY);
  /* utilizam un port utilizator */
  server.sin_port = htons(PORT);

  /* atasam socketul */
  if (bind(sd, (struct sockaddr *)&server, sizeof(struct sockaddr)) == -1)
  {
    perror("[server]Eroare la bind().\n");
    return errno;
  }

  /* punem serverul sa asculte daca vin clienti sa se conecteze */
  if (listen(sd, 5) == -1)
  {
    perror("[server]Eroare la listen() la client.\n");
    return errno;
  }

  // Signal
  if (signal(SIGCHLD, sig_wait) == SIG_ERR)
  {
    perror("signal()");
    return 1;
  }

  /* servim in mod iterativ clientii... */
  while (1)
  {
    int client;
    int length = sizeof(from);

    printf("[server]Asteptam client la portul %d...\n", PORT);
    fflush(stdout);

    /* acceptam un client (stare blocanta pina la realizarea conexiunii) */
    client = accept(sd, (struct sockaddr *)&from, &length);

    /* eroare la acceptarea conexiunii de la un client */
    if (client < 0)
    {
      perror("[server]Eroare la accept().\n");
      continue;
    }
    int pid = fork();

    if (pid < 0)
    {
      perror("[server]Eroare la pid=fork(). \n");
      return errno;
    }

    if (pid == 0)
    {
      // receptionam mesaje de la client
      cl_msg_rec(client);
      close(client);
      exit(1);
    }
  } /* while */
} /* main */
