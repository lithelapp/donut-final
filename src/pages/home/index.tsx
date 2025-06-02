export default function Home() {
  return (
    <div className="flex flex-col items-center mt-5 text-center">
      <img src='/images/donut-main.svg' alt="Donut Main" className="w-64 h-64 mb-6" />
      <h1 className="text-3xl font-bold mb-4">Welcome to Donut Delight!</h1>
      <p className="text-lg mb-6">
        Explore a wide range of delicious donuts and enjoy a virtual eating experience. No calories, just fun!
      </p>
    </div>
  );
}