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
/** Founder's note at the top of the footer. */
export const FOUNDER = {
  name: "Sunita Patgar",
  title: "Founder & CEO",
  quote:
    "I started this brand to give the women around me clothing they truly deserve: beautiful, comfortable, and made to last.",
  /**
   * Profile photo: a square photo in the `public` folder (e.g. "/founder.jpg") or a Cloudinary URL.
   * Leave empty to show the founder's initials instead.
   */
  photo: "",
};
/** When customers can expect a reply (Contact page). */
export const STORE_HOURS = "Monday to Saturday, 10 am to 7 pm";
/**
 * Grievance Officer shown in the Privacy Policy and Terms (required by India's
 * Consumer Protection (E-Commerce) Rules, 2020). Usually the owner's full name.
 */
export const GRIEVANCE_OFFICER = "Store Owner";
/** Courts named in the Terms & Conditions; usually the city where the business is registered. */
export const STORE_JURISDICTION = "Bengaluru, Karnataka";

/** Prefix for human-readable order numbers, e.g. AC1001. */
export const ORDER_NUMBER_PREFIX = "AC";
export const ORDER_NUMBER_START = 1001;

export const FREE_SHIPPING_THRESHOLD = 99900; // ₹999
export const SHIPPING_FEE = 7900; // ₹79
export const COD_FEE = 4900; // ₹49
export const COD_MAX_ORDER_VALUE = 1000000; // ₹10,000 (above this, COD is hidden)
export const MAX_QTY_PER_ITEM = 5;

// Policy facts shown on the policy pages, product pages and in Google's product data.
// TODO(owner): confirm these match how you actually work.
/** Business days to pack and hand an order to the courier. */
export const DISPATCH_DAYS = { min: 1, max: 2 };
/** Business days the courier takes after dispatch. */
export const TRANSIT_DAYS = { min: 3, max: 7 };
/** Days after delivery to ask for an exchange or return. */
export const RETURN_WINDOW_DAYS = 7;
/** Hours after delivery to report a damaged or wrong item. */
export const DAMAGE_REPORT_HOURS = 48;

export const KURTI_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export const SAREE_SIZE = "Free Size";
