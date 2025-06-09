
  import { type Booking } from "./booking";
  
  export interface SalesReportResponse {
    start_date?: string;
    end_date?: string;
    total_sales: string;
    average_sale: string;
    booking_count: number;
    bookings: Booking[];
    metrics: {
      total_sales_raw: number;
      average_sale_raw: number;
    };
  }
  