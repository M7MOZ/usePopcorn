import { useEffect, useState } from "react";

export default function Currency() {
//   const [input, setInput] = useState(1);
//   const [output, setOutput] = useState('');
//   const [from, setFrom] = useState("EUR");
//   const [to, setTo] = useState("USD");
//   useEffect(() => {
//     if (from === to || input === '') return;
//     async function fetchData() {
//       const res = await fetch(
//         `https://api.frankfurter.app/latest?amount=${input}&from=${from}&to=${to}`
//       );
//       const data = await res.json();
//       setOutput(data.rates[to]);
//     }
//     fetchData();
//     return () => {
//       console.log('cleanup');
//       setOutput('');
//     };
//   },[input, from, to]);
//   return (
//     <div>
//       <input type="text" value={input} onChange={(e) => setInput(e.target.value)}/>
//       <select value={from} onChange={(e) => setFrom(e.target.value)}>
//         <option value="USD">USD</option>
//         <option value="EUR">EUR</option>
//         <option value="CAD">CAD</option>
//         <option value="INR">INR</option>
//       </select>
//       <select value={to} onChange={(e) => setTo(e.target.value)}>
//         <option value="USD">USD</option>
//         <option value="EUR">EUR</option>
//         <option value="CAD">CAD</option>
//         <option value="INR">INR</option>
//       </select>
//       <p>{output}</p>
//     </div>
const [counter, setCounter] = useState(() => {
    const stored = localStorage.getItem("counter")
    return stored ? JSON.parse(stored) : 0;
  });

  useEffect(() => {
    localStorage.setItem("counter", JSON.stringify(counter));
  },[counter]);
  return (
    <div className="App">
      <button onClick={() => setCounter((prev) => prev + 1)}>+</button>
      <button onClick={() => setCounter((prev) => (prev > 0 ? prev - 1 : 0))}>
        -
      </button>
      <p>{counter}</p>
    </div>
  );
}
