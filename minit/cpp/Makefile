run: 17
b:
	clang++ main.cpp && cat input | ./a.out
17:
	clang++ -std=c++17 main.cpp -Wall -g -fsanitize=undefined -D_GLIBCXX_DEBUG
	./a.out < input
14:
	clang++ -std=c++14 main.cpp -Wall -g -fsanitize=undefined -D_GLIBCXX_DEBUG
	./a.out < input
11:
	clang++ -std=c++11 main.cpp -Wall -g -fsanitize=undefined -D_GLIBCXX_DEBUG
	./a.out < input
