export const base64ToBuffer = (base64: string) => {
  const split = base64.split(",");
  const base64string = split[1];
  const buffer = Buffer.from(base64string, "base64");

  return buffer;
};

export const bufferToBase64 = (buffer: Buffer, type: string) => {
  const base64 = buffer.toString("base64");
  const newBase64 = `data:${type};base64,${base64}`;
  return newBase64;
};
