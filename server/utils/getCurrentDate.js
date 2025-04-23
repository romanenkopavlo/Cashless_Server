export const getCurrentDate = () => {
    const options = {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    const date = new Date().toLocaleString('fr-FR', options);
    const [datePart, timePart] = date.split(' ');
    const [day, month, year] = datePart.split('/');
    return `${year}-${month}-${day} ${timePart}`;
}