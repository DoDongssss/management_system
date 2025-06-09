import { useState } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';

import AppLayout from "@/layouts/app-layout";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type SalesReportResponse } from "@/types/report";

export default function ReportIndex() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [outputType, setOutputType] = useState("table");
  const [reportData, setReportData] = useState<SalesReportResponse | null>(null);

  const handleGenerate = async (startDate: string, endDate: string) => {
    try {

      const response = await axios.post('/report/sales', {
        start_date: startDate,
        end_date: endDate,
      }, {
        responseType: 'blob' // This is crucial for handling PDF responses
      });
    
      // Create a blob URL for the PDF
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Open in new tab or download
      window.open(pdfUrl);

      // const response = await axios.post('/report/sales', {
      //   start_date: startDate,
      //   end_date: endDate,
      // });

      // console.log(response, 'response')
  
      // if (response.data.success) {
      //   // console.log('Sales Report:', response.data.data);
      //   setReportData(response.data.data);
  
      //   const report = response.data.data;
  
      //   if (outputType === "excel") {
      //     const bookingRows = report.bookings.map((booking: any) => ({
      //       ID: booking.id,
      //       "Room Number": booking.room?.room_number ?? '-',
      //       "Room Name": booking.room?.name ?? '-',
      //       "Check In": dayjs(booking.check_in).format("MMMM D, YYYY h:mm A"),
      //       "Check Out": dayjs(booking.check_out).format("MMMM D, YYYY h:mm A"),
      //       "Duration (Hours)": booking.total_duration_hours ?? '-',
      //       "Amount": booking.total_amount ?? '-',
      //     }));
  
      //     bookingRows.push({});
      //     bookingRows.push({ ID: "Total Sales", "Room Number": report.total_sales });
      //     bookingRows.push({ ID: "Average Sale", "Room Number": report.average_sale });
      //     bookingRows.push({ ID: "Total Bookings", "Room Number": report.booking_count });
  
      //     const worksheet = XLSX.utils.json_to_sheet(bookingRows);
      //     const workbook = XLSX.utils.book_new();
      //     XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
  
      //     const filename = `sales-report-${dayjs().format('YYYY-MM-DD')}.xlsx`;
      //     XLSX.writeFile(workbook, filename);
  
      //   } else if (outputType === "pdf") {
      //     const url = `/report/sales/pdf?start_date=${startDate}&end_date=${endDate}`;
      //     window.open(url, '_blank');
      //   }
  
      // } else {
      //   console.error('Failed to generate report:', response.data.message);
      // }
    } catch (error: any) {
      if (error.response?.status === 422) {
        console.error('Validation errors:', error.response.data.errors);
      } else {
        console.error('Something went wrong:', error.response?.data?.message || error.message);
      }
    }
  };


  return (
    <AppLayout>
      <Head title="Report" />
      <div className="flex flex-col gap-4 p-6">
        {/* Filters */}
        <div className="flex justify-between items-end gap-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select value={outputType} onValueChange={setOutputType}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleGenerate(startDate, endDate)}>Generate</Button>
          </div>
        </div>

        {/* Report Summary */}
        {outputType === "table" && reportData && (
          <div className="flex flex-col gap-6 mt-6">
            <div className="border p-4 rounded-lg bg-gray-50 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">Total Sales</div>
                <div className="font-bold text-lg">{reportData.total_sales}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Average Sale</div>
                <div className="font-bold text-lg">{reportData.average_sale}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Bookings</div>
                <div className="font-bold text-lg">{reportData.booking_count}</div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-hidden border border-gray-300 rounded-lg">
              <Table className="w-full">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="px-4 py-2">ID</TableHead>
                    <TableHead className="px-4 py-2">Room Number</TableHead>
                    <TableHead className="px-4 py-2">Room Name</TableHead>
                    <TableHead className="px-4 py-2">Check In</TableHead>
                    <TableHead className="px-4 py-2">Check Out</TableHead>
                    <TableHead className="px-4 py-2">Duration</TableHead>
                    <TableHead className="px-4 py-2">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="px-4 py-2">{booking.id}</TableCell>
                      <TableCell className="px-4 py-2">{booking.room?.room_number ?? '-'}</TableCell>
                      <TableCell className="px-4 py-2">{booking.room?.name ?? '-'}</TableCell>
                      <TableCell className="px-4 py-2">{dayjs(booking.check_in).format("MMMM D, YYYY h:mm A") ?? '-'}</TableCell>
                      <TableCell className="px-4 py-2">{dayjs(booking.check_out).format("MMMM D, YYYY h:mm A") ?? '-'}</TableCell>
                      <TableCell className="px-4 py-2">{booking.total_duration_hours ?? '-'}</TableCell>
                      <TableCell className="px-4 py-2">{booking.total_amount ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
