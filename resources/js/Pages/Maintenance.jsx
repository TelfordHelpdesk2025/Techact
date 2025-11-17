// import React, { useEffect, useState } from "react";
// import "./App.css"; // Optional—pwede ring inline if gusto mo

// export default function Maintenance() {
//   const [theme, setTheme] = useState("default");

//   useEffect(() => {
//     const today = new Date();
//     const month = today.getMonth() + 1;
//     const day = today.getDate();

//     const isChristmas =
//       (month === 11 && day >= 3) || 
//       month === 12 || 
//       (month === 1 && day <= 2);

//     setTheme(isChristmas ? "christmas" : "default");
//   }, []);

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         transition: "0.5s",
//         color: theme === "christmas" ? "white" : "#222",
//         background:
//           theme === "christmas"
//             ? "linear-gradient(135deg, #ff3f3f, #b30000)"
//             : "linear-gradient(120deg, #f5f7fa, #c3cfe2)",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         flexDirection: "column",
//         position: "relative",
//         overflow: "hidden"
//       }}
//     >

//       {/* SNOW EFFECT */}
//       {theme === "christmas" && (
//         <div
//           style={{
//             position: "absolute",
//             top: "-10%",
//             left: 0,
//             width: "100%",
//             height: "120%",
//             backgroundImage: "url('https://i.imgur.com/2yaf2wb.png')",
//             backgroundRepeat: "repeat",
//             opacity: 0.6,
//             animation: "snowFall 8s linear infinite",
//             pointerEvents: "none"
//           }}
//         />
//       )}

//       <h1 style={{ fontSize: "3rem", fontWeight: "700", textAlign: "center" }}>
//         {theme === "christmas" ? "🎄 Merry Christmas!" : "✨ Welcome!"}
//       </h1>

//       <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>
//         {theme === "christmas"
//           ? "Enjoy our festive holiday theme!"
//           : "Normal mode active."}
//       </p>

//       {/* Snow keyframes */}
//       <style>
//         {`
//           @keyframes snowFall {
//             0% { background-position: 0 0; }
//             100% { background-position: 0 800px; }
//           }
//         `}
//       </style>
//     </div>
//   );
// }
