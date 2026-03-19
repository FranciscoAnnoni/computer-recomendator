export type UsageProfile = "design" | "programming" | "study" | "general";

export interface Laptop {
  id: string;                      // UUID primary key
  name: string;                    // e.g., "MacBook Air M3"
  brand: string;                   // e.g., "Apple"
  price: number;                   // numeric price in USD

  // Technical specs
  cpu: string;                     // e.g., "Apple M3 chip"
  ram: string;                     // e.g., "16GB"
  gpu: string;                     // e.g., "Integrated 10-core GPU"
  storage: string;                 // e.g., "512GB SSD"

  // Dummies mode fields
  simplified_tags: string[];       // e.g., ["Very Fast", "Supports Photoshop"]

  // Filtering
  usage_profiles: UsageProfile[];  // e.g., ["design", "programming"]

  // Influencer content
  influencer_note: string;         // personal recommendation text
  recommendation_score: number;    // 1-10 score

  // Links & media
  affiliate_link: string;          // external purchase URL
  image_url: string;               // product image URL

  // Timestamps
  created_at: string;              // ISO timestamp
  updated_at: string;              // ISO timestamp
}
