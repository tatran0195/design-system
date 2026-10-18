/** Structural presentation models. These do not require an SDK, store, or API. */
export interface EntityReference {
  id: string;
}
export interface NamedEntity extends EntityReference {
  name: string;
  description?: string | null;
}
export interface AddressValue {
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  province?: string | null;
  country_code?: string | null;
  phone?: string | null;
}
export interface CustomerSummary extends EntityReference {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  has_account?: boolean;
}
export interface CountryOption {
  iso_2: string;
  iso_3?: string;
  num_code?: string;
  name?: string;
  display_name?: string;
}
export interface ProductSummary extends EntityReference {
  title: string;
  thumbnail?: string | null;
  status?: ProductStatus;
}
export type ProductStatus = 'draft' | 'proposed' | 'published' | 'rejected' | (string & {});
export interface ProductVariantSummary extends EntityReference {
  title?: string | null;
  sku?: string | null;
  manage_inventory?: boolean;
  inventory_quantity?: number;
  inventory_items?: { inventory?: InventorySummary | null }[];
}
export interface CollectionSummary extends EntityReference {
  title: string;
}
export interface ChannelSummary extends NamedEntity {
  is_disabled?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}
export interface ProviderSummary extends EntityReference {
  name?: string;
}
export interface RegionSummary extends NamedEntity {
  currency_code: string;
  countries?: CountryOption[];
}
export interface PricePreference {
  attribute: string;
  value: string;
  is_tax_inclusive?: boolean;
}
export interface OrderSummary extends EntityReference {
  customer_id?: string | null;
  customer?: CustomerSummary | null;
  email?: string | null;
  shipping_address?: AddressValue | null;
  billing_address?: AddressValue | null;
  payment_status?: string;
  fulfillment_status?: string;
  status?: string;
}
export interface PromotionSummary extends EntityReference {
  status?: string;
  campaign?: { starts_at?: string | null; ends_at?: string | null } | null;
}
export interface InventorySummary extends EntityReference {
  title?: string;
  sku?: string | null;
  thumbnail?: string | null;
  location_levels?: EntityReference[];
}
export interface ChannelListQuery {
  limit?: number;
  offset?: number;
  q?: string;
  order?: string;
  created_at?: unknown;
  updated_at?: unknown;
  is_disabled?: boolean;
}
