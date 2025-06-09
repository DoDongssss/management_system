<!DOCTYPE html>
<html>
<head>
    <title>Sales Report</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    </style>
</head>
<body>
    <h2>Sales Report</h2>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Room Number</th>
                <th>Room Name</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Duration (Hours)</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($report['bookings'] as $booking)
                <tr>
                    <td>{{ $booking['id'] }}</td>
                    <td>{{ $booking['room']['room_number'] ?? '-' }}</td>
                    <td>{{ $booking['room']['name'] ?? '-' }}</td>
                    <td>{{ \Carbon\Carbon::parse($booking['check_in'])->format('F d, Y h:i A') }}</td>
                    <td>{{ \Carbon\Carbon::parse($booking['check_out'])->format('F d, Y h:i A') }}</td>
                    <td>{{ $booking['total_duration_hours'] ?? '-' }}</td>
                    <td>{{ $booking['total_amount'] ?? '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p><strong>Total Sales:</strong> {{ $report['total_sales'] }}</p>
    <p><strong>Average Sale:</strong> {{ $report['average_sale'] }}</p>
    <p><strong>Total Bookings:</strong> {{ $report['booking_count'] }}</p>
</body>
</html>
