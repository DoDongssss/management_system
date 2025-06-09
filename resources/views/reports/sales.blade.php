<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sales Report</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background-color: #f2f2f2; }
        h1, h3 { text-align: center; }
    </style>
</head>
<body>
    <h1>Sales Report</h1>
    <h3>{{ $start_date }} to {{ $end_date }}</h3>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Room Number</th>
                <th>Room Name</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Duration (hours)</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($bookings as $booking)
            <tr>
                <td>{{ $booking['id'] }}</td>
                <td>{{ $booking['room']['room_number'] ?? '-' }}</td>
                <td>{{ $booking['room']['name'] ?? '-' }}</td>
                <td>{{ \Carbon\Carbon::parse($booking['check_in'])->format('M d, Y h:i A') }}</td>
                <td>{{ \Carbon\Carbon::parse($booking['check_out'])->format('M d, Y h:i A') }}</td>
                <td>{{ $booking['total_duration_hours'] ?? '-' }}</td>
                <td>{{ $booking['total_amount'] ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top: 40px; text-align: center;">
        <strong>Total Sales:</strong> {{ $total_sales }}<br>
        <strong>Average Sale:</strong> {{ $average_sale }}<br>
        <strong>Total Bookings:</strong> {{ $booking_count }}
    </div>
</body>
</html>
