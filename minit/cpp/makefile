run: 17
b:
	clang++ Main.cpp && cat input | ./a.out
17:
	clang++ -std=c++17 Main.cpp -Wall -g -fsanitize=undefined -D_GLIBCXX_DEBUG -lncurses
	./a.out < input
14:
	clang++ -std=c++14 Main.cpp -Wall -g -fsanitize=undefined -D_GLIBCXX_DEBUG -lncurses
	./a.out < input
11:
	clang++ -std=c++11 Main.cpp -Wall -g -fsanitize=undefined -D_GLIBCXX_DEBUG
	./a.out < input
