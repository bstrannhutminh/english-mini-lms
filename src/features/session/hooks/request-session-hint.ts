/** A failed event must never expose help that the server cannot mark as assisted. */
export async function requestSessionHint(
  postEvent: (kind: "hint") => Promise<boolean>,
  onAccepted: () => void,
): Promise<boolean> {
  const accepted = await postEvent("hint");
  if (accepted) onAccepted();
  return accepted;
}
