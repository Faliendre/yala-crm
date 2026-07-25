export interface User {
  id: number;
  username: string;
  role: 'admin' | 'seller';
  avatar?: string;
}

export interface Captacion {
  id: number;
  business_name: string;
  category: string;
  address: string;
  google_maps?: string;
  business_hours?: string;
  accepts_card: boolean; // Recibió tarjeta YALASOFT
  gave_card: boolean;    // Nos dio su tarjeta
  licensing_type?: string;
  offered_hosting: boolean;
  hosting_price?: number;
  owner_name: string;
  contact_name?: string;
  phone: string;
  whatsapp?: string;
  offered_application?: string;
  offered_price?: number;
  promotion?: string;
  status: 'Captación' | 'Follow-up' | 'Training' | 'Negotiation' | 'Closed Sale' | 'Lost';
  notes?: string;
  seller_id: number;
  seller?: User;
  visits?: Visit[];
  followups?: Followup[];
  sales?: Sale[];
  suggestions?: Suggestion[];
  created_at?: string;
  updated_at?: string;
}

export interface Visit {
  id: number;
  captacion_id: number;
  seller_id: number;
  visit_date: string;
  result: string;
  notes?: string;
  captacion?: Captacion;
  seller?: User;
  created_at?: string;
}

export interface Followup {
  id: number;
  captacion_id: number;
  date: string;
  notes: string;
  next_contact?: string;
  result?: string;
  status?: 'pending' | 'rescheduled' | 'completed';
  captacion?: Captacion;
  created_at?: string;
}

export interface Sale {
  id: number;
  captacion_id: number;
  sold_system: string;
  price: number;
  discount: number;
  commission: number;
  sale_date: string;
  captacion?: Captacion;
  created_at?: string;
}

export interface Commission {
  id: number;
  seller_id: number;
  sale_id: number;
  amount: number;
  seller?: User;
  sale?: Sale;
  created_at?: string;
}

export interface Suggestion {
  id: number;
  captacion_id: number;
  description: string;
  created_at?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
