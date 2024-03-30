const email1 = ({orderId,customerEmail,customerName,packageName,packagePrice,discount,totalPrice,paymentMode}) => {
    console.log('the template data..',{orderId,customerEmail,customerName,packageName,packagePrice,discount,totalPrice,paymentMode})
    const template = `<!DOCTYPE html>
    <html>
    
    <head>
        <style>
            /* Gmail resets */
            body {
                margin: 0;
                padding: 0;
            }
    
            table {
                border-collapse: collapse;
            }
    
            img {
                border: none;
                max-width: 100%;
                height: auto;
            }
    
            /* Email wrapper */
            .email-wrapper {
                width: 100%;
                max-width: 600px;
                margin: auto;
                font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
                color: #555;
            }
    
            /* Invoice box */
            .invoice-box {
                border: 1px solid #eee;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
                padding: 30px;
                font-size: 16px;
                line-height: 24px;
            }
    
            /* Invoice headings */
            .invoice-box h2 {
                font-size: 24px;
                font-weight: bold;
                color: #333;
                margin: 0;
            }
    
            /* Invoice details */
            .invoice-box p {
                margin: 10px 0;
            }
    
            /* Invoice table */
            .invoice-box table {
                width: 100%;
                margin-top: 20px;
                border-collapse: collapse;
            }
    
            .invoice-box table th,
            .invoice-box table td {
                border: 1px solid #eee;
                padding: 8px;
            }
    
            .invoice-box table th {
                background-color: #eee;
                font-weight: bold;
                text-align: left;
            }
    
            /* Total row */
            .invoice-box .total td {
                border-top: 2px solid #eee;
                font-weight: bold;
            }
    
            /* Button */
            .invoice-box .button {
                background-color: #2D7CE2;
                border: none;
                border-radius: 5px;
                color: white;
                box-shadow: 6px 6px 6px gray;
                font-weight: 600;
                padding: 10px 30px;
                font-size: 16px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
            }
    
            /* Image */
            .logo img {
                width: 30px;
                max-width: 100%;
            }
        </style>
    </head>
    
    <body>
        <div class="email-wrapper">
            <div class="invoice-box">
                <div style="display: flex;">
                    <div style=""><img style="width: 30px;"
                            src="https://res.cloudinary.com/dor3gao8l/image/upload/v1698297437/COLLIBET%20HOME%20SERVICES/logo/COLLIBET_LOGO_evczka.png"
                            style="width: 100%; max-width: 300px" /> </div>
                    <div style="font-weight: bold;color: black; font-size: 24px; padding-left: 4px;">Collibet</div>
                </div>
    
    
                <p style="color: gray; font-weight: 600;"># Order-Id : ${orderId}</p>
    
                <p>ABC Colony, Inc<br>Hindpiri road, Ranchi, jharkhand</p>
                <p>Collibet.com</p>
    
                <p style="margin-top: 20px; color: #2D7CE2; font-weight: 600;">Hi, ${customerName}</p>
                <p style="color: gray;">Your service having order no: ${orderId} has been successfully completed. Thank
                    you for choosing Collibet home service.</p>
    
                <table>
                    <tr>
                        <th>Payment Method</th>
                        <td>${paymentMode}</td>
                    </tr>
                    <tr>
                        <th>Amount</th>
                        <td>₹${totalPrice}</td>
                    </tr>
                    <tr>
                        <th>Item</th>
                        <th>Price</th>
                    </tr>
                    <tr>
                        <td>${packageName}</td>
                        <td>₹${packagePrice}</td>
                    </tr>
                    <tr class="total">
                        <td colspan="2">Total: ₹${totalPrice}</td>
                    </tr>
                </table>
            </div>
    
            <div style="margin-top: 20px; text-align: center;">
                <p style="color: gray; font-style: italic;">For more details, please visit <a
                        href="https://collibet.com/">Collibet.com</a></p>
            </div>
    
    
            <div style="text-align: center; margin-top: 20px; margin-bottom: 40px;">
                <a href="https://collibet.com/" style="text-decoration: none;">
                    <button class="button"
                        style="background-color: #2D7CE2; border: none; border-radius: 5px; color: white; font-weight: 600; padding: 10px 30px; font-size: 16px; cursor: pointer; display: inline-block;">
                        Book More Service
                    </button>
                </a>
            </div>
        </div>
    </body>
    
    </html>`

    return template
}

module.exports = email1