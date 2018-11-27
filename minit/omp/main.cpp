#include <stdio.h>
#include <omp.h>

int main()
{
#pragma omp parallel
  {
    printf("hello world from %dPU of %dPU\n", omp_get_thread_num(), omp_get_num_threads());
  }
  
  return 0;
}
