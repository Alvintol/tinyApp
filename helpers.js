const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    };
  }; return false;
};

generateRandomString = () => {
  const charList = "abcdefghijklmnopqrstuvwxyz0123456789";
  const randomID = [];
  while (randomID.length < 6) {
    randomID.push(charList[Math.floor(Math.random() * charList.length)]);
  };
  return randomID.join('');
};

const date = new Date();
const getDate = () => {
  let month = date.getMonth() + 1;
  let day = date.getDay();
  let year = date.getFullYear();

  switch (month) {
    case 1: month = 'Jan';
    break;
    case 2: month = 'Feb';
    break;
    case 3: month = 'Mar';
    break;
    case 4: month = 'Apr';
    break;
    case 5: month = 'May';
    break;
    case 6: month = 'Jun';
    break;
    case 7: month = 'Jul';
    break;
    case 8: month = 'Aug';
    break;
    case 9: month = 'Sep';
    break;
    case 10: month = 'Oct';
    break;
    case 11: month = 'Nov';
    break;
    case 12: month = 'Dec';
    break;
  };
  return `${month} ${day}, ${year}`
};

module.exports = {
  getUserByEmail,
  generateRandomString, 
  getDate
};