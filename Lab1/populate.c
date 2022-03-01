
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
    int message_number = atoi(argv[1]);
    FILE *fd;
    fd = fopen("messages.txt", "w");
    for (int i = 0; i < message_number; i++)
    {
        fputs("linie mesaj linie mesaj linie mesaj linie mesaj linie mesaj vlinie mesaj\n", fd);
    }
    fclose(fd);
}
