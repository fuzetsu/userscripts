let a = 10
let b = (m) => {
  if (m <2)
    return 1;
  return m * b(m - 1);
};
console.log(b());
