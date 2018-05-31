function Main(input)
{
  input = input.split("\n");

  var a = parseInt(input[0], 10);

  console.log('%d', a);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
