const QR_INDEX = 4;
const LINK_SEPARATOR = '/';

export function qrFromLink(link: string) {
  return link.split(LINK_SEPARATOR)[QR_INDEX];
}

export function extractLinkQR(link: string) {
  const split = link.split(LINK_SEPARATOR);
  return {
    domain: split[2],
    productId: split[3],
    qr: split[4],
  };
}
