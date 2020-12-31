
let arr;



fetch('/dashboard/grabRoutes', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
})
    .then((response) => response.json())
    .then((data) => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });




export default arr;

