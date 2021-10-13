// export class UtilsHelper {

//   public static setObject(key, value) {
//     if (this.lsSpaceAvailable(key, value) === true) {
//       localStorage.setItem(key, JSON.stringify(value));
//     } else {
//       sessionStorage.setItem(key, JSON.stringify(value));
//     }
//   }

//   public static lsSpaceAvailable(key, value) {
//     try {
//       localStorage.setItem(key, JSON.stringify(value));
//       localStorage.removeItem(key);
//       return true;
//     } catch (e) {
//       return false;
//     }
//   }

//   /**
//    *
//    * Get token
//    * @public
//    * @memberof UtilsHelper
//    */
//   public static getToken() {
//     let token = JSON.parse(localStorage.getItem('token'));
//     if (!!token) {
//       return token;
//     }
//     return false;
//   }

//   public static get IsLoggedIn():boolean {
//     try{
//       let token = JSON.parse(localStorage.getItem('token'));
//       return !!token;
//     }catch (e){
//       let token = localStorage.getItem('token');
//       return !!token;
//     }
//   }

//   public static getObject(key) {
//     if (localStorage.getItem(key)) {
//       return JSON.parse(localStorage.getItem(key));
//     } else {
//       return JSON.parse(sessionStorage.getItem(key));
//     }
//   }

//   public static clearAll() {
//     localStorage.clear();
//   }

//   public static removeObject(key) {
//     if (localStorage.getItem(key)) {
//       return localStorage.removeItem(key);
//     }
//   }

//   /**
//    *  Get login user name
//    */
//   public static getUserName() {
//     let user = localStorage.getItem('userName');
//     if (user) {
//       return JSON.parse(user);
//     } else {
//       return "";
//     }
//   }

//   /**
//   *  Get Authorization token
//   */
//   public static getAuthToken() {
//     let token = JSON.parse(localStorage.getItem('token'));
//     if (token) {
//       return `Bearer ${token}`;
//     } else {
//       return "";
//     }
//   }






// }
