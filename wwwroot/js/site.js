$(function () {
    $('#date').daterangepicker({
        timePicker: true,
        startDate: moment().startOf('hour'),
        endDate: moment().startOf('hour').add(32, 'hour'),
        locale: {
            separator: "-",
            format: 'MM/DD/YYYY HH:mm'
        }
    });
});