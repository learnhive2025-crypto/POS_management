export default function Invoice({ sale }: any) {
  return (
    <div id="invoice">
      <h3>Invoice</h3>
      <p>Bill No: {sale.bill_no}</p>
      <p>Date: {new Date(sale.created_at).toLocaleString()}</p>

      <table border={1} width="100%">
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((i: any, idx: number) => (
            <tr key={idx}>
              <td>{i.barcode}</td>
              <td>{i.qty}</td>
              <td>{i.price}</td>
              <td>{i.qty * i.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>Total: ₹{sale.total_amount}</h4>
    </div>
  );
}
