const moment = require('moment');
moment.locale('es');
module.exports = (user = {}, dateRange = {}) => {
    var mothHours = 0
    var userRow = ``;
    for (const checkPos in user.checks) {
        var check = user.checks[checkPos];
        var dayHours = (check.checkOut - check.checkIn) / 3600;
        mothHours += dayHours;
        userRow += ` 
        <div class="row">
            <div class="col basis40 border-r">${ moment.unix(check.checkIn).utc().format("dddd DD-MM-YYYY HH:mm Z")}</div>
            <div class="col basis40 border-r">${moment.unix(check.checkOut).utc().format("dddd DD-MM-YYYY HH:mm Z")}</div>
            <div class="col basis20">${dayHours.toFixed(2)} h</div>
        </div>
        `;
    }

    return `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <style>
        html,
        body {
            margin: 0;
            padding: 20px;
        }

        .table {
            display: flex;
            flex-direction: column;
            padding: 30px;
            text-align: center;
        }

        .row {
            display: flex;
            border-bottom: 1px solid black;
            padding: 5px 0px;
            color: black;
        }

        .basis40 {
            flex-basis: 40%;
        }

        .basis20 {
            flex-basis: 20%;
        }

        .border-r {
            border-right: 1px solid black;
        }

        .header {
            font-weight: bolder;
            border-top: 1px solid black;
        }

        p,h1{
            margin: 0;
            padding: 0;
        }
    </style>
</head>

<body>
    <h1>Entradas y Salidas (${dateRange.from}-${dateRange.to})</h1>
    <p>nombre: ${user.name}</p>
    <p>uid: ${user._id}</p>
    <p>total de horas trabajadas: ${mothHours.toFixed(2)}h</p>
    <p>coste horas: </p>
    <div class="table">
        <div class="row header">
            <div class="col basis40 border-r">Entradas</div>
            <div class="col basis40 border-r">Salidas</div>
            <div class="col basis20">Horas</div>
        </div>

        ${userRow}
    </div>
</body>

</html>
    `
}