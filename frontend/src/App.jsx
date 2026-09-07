import './App.css'
import AdjustBalanceModel from './Components/AdjustBalanceModal'

function App(){
  return (
    <AdjustBalanceModel
      account={{ _id: "6a9df2d0dcebca5c67158705", name: "حساب تجريبي", balance: 500, currency: "EGP" }}
      apiBaseUrl="http://localhost:5000"
      onUpdated={(acc) => console.log('اتحدث:', acc)}
    />
  );
}

export default App
