// Store-wide settings (BUILD_PLAN Section 2). Money values are in paise.
// TODO(owner): replace the placeholder contact details before launch.

export const STORE_NAME = "Anisu Collection";
export const STORE_TAGLINE = "Handpicked sarees & kurtis";
export const STORE_PHONE = "+91 95359 80590";
export const STORE_EMAIL = "kiranwaghamode99@gmail.com";
/** WhatsApp number in international format, digits only (used in wa.me links). */
export const STORE_WHATSAPP = "919535980590";
export const STORE_ADDRESS = "Uttara halli, Bangalore";
export const STORE_INSTAGRAM = "https://instagram.com/anisucollection";

/** Prefix for human-readable order numbers, e.g. AC1001. */
export const ORDER_NUMBER_PREFIX = "AC";
export const ORDER_NUMBER_START = 1001;

export const FREE_SHIPPING_THRESHOLD = 99900; // ₹999
export const SHIPPING_FEE = 7900; // ₹79
export const COD_FEE = 4900; // ₹49
export const COD_MAX_ORDER_VALUE = 1000000; // ₹10,000 (above this, COD is hidden)
export const MAX_QTY_PER_ITEM = 5;

export const KURTI_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export const SAREE_SIZE = "Free Size";
