/* This code is based on a TCP client example.
  Original code author: Lenuta Alboaie  <adria@infoiasi.ro> (c)2009
*/
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <errno.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <netdb.h>
#include <string.h>
#include <signal.h>

#define PORT 2024

extern int errno;

void sig_wait(int sig)
{
  wait(1);
}

void send_msgs(int sd)
{

  char msg[900];
  int i = 0;
  // bzero(msg, 900);
  printf("Trimit mesaje catre server...\n");
  fflush(stdout);
  while (i < 5)
  {
    if (write(sd, "Mesaj\n", 900) <= 0)
    {
      perror("[client]Eroare la write() spre server.\n");
      return errno;
    }
    // bzero(msg, 900);
    // read(0, msg, 900);
  }
  if (write(sd, "quit\n", 900) <= 0)
  {
    perror("[client]Eroare la write() spre server.\n");
    return errno;
  }
}

int main(int argc, char *argv[])
{
  int sd;
  struct sockaddr_in server;

  if (argc != 2)
  {
    printf("Sintaxa: %s <adresa_server> \n", argv[0]);
    return -1;
  }
  if (signal(SIGCHLD, sig_wait) == SIG_ERR)
  {
    perror("signal()");
    return 1;
  }

  if ((sd = socket(AF_INET, SOCK_STREAM, 0)) == -1)
  {
    perror("Eroare la socket().\n");
    return errno;
  }

  server.sin_family = AF_INET;

  server.sin_addr.s_addr = inet_addr(argv[1]);

  server.sin_port = htons(PORT);

  if (connect(sd, (struct sockaddr *)&server, sizeof(struct sockaddr)) == -1)
  {
    perror("[client]Eroare la connect().\n");
    return errno;
  }

  send_msgs(sd);

  close(sd);
  return 0;
}
