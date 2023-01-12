export const status = {
  success: "success",
  fail: "fail",
};

export function delay(second) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, second * 1000);
  });
}
