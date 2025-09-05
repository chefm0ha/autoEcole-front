export interface Vehicle {
  immatriculation: string;
  amountVignette?: number;
  category: string;
  dateLastVignette?: string;
  kmInitial?: number;
  vehicleBrand?: string;
  fuelType?: string;
  vehicleType?: string;
  quota?: number; // Now available as transient field
}