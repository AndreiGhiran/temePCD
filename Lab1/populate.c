#include <sys/stat.h>
#include <sys/ioctl.h>
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

int main(int argc, char *argv[])
{

    FILE *fd;
    fd = fopen("messages.txt", "a");
    for (int i = 0; i < 1500000; i++)
    {
        fputs("Linie mesaj\n", fd);
    }
    close(fd);
}
