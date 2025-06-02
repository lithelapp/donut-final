import { useState, useEffect } from "react";
import { useDonuts } from "@/api/donuts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Donut } from "@/api/types/donut";

function shuffleArray<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

export default function List() {
  const { data: donuts, isLoading, isError } = useDonuts();
  const [chompedDonuts, setChompedDonuts] = useState<number[]>(() => {
    const saved = sessionStorage.getItem("chompedDonuts");
    return saved ? JSON.parse(saved) : [];
  });

  const [shuffledDonuts, setShuffledDonuts] = useState<Donut[]>([]);

  // Load shuffled donuts from sessionStorage or create a new shuffled array
  useEffect(() => {
    if (donuts) {
      // Try to get saved donut order from sessionStorage
      const savedOrder = sessionStorage.getItem("donutOrder");

      if (savedOrder && chompedDonuts.length > 0) {
        // If we have a saved order and chomped donuts, use the saved order
        try {
          const parsedOrder = JSON.parse(savedOrder) as number[];
          // Map the saved IDs back to actual donut objects
          const reconstructedDonuts = parsedOrder
            .map((id) => donuts.find((donut) => donut.id === id))
            .filter(Boolean) as Donut[];

          // Check if all donuts from the API exist in our saved order
          const allDonutsIncluded = donuts.every((donut) =>
            parsedOrder.includes(donut.id)
          );

          if (reconstructedDonuts.length === donuts.length && allDonutsIncluded) {
            setShuffledDonuts(reconstructedDonuts);
            return;
          }
        } catch (e) {
          console.error("Error parsing saved donut order:", e);
        }
      }

      // If no valid saved order exists, create a new shuffled array
      const newShuffledArray = shuffleArray([...donuts]);
      setShuffledDonuts(newShuffledArray);

      // Save the new order to sessionStorage (just the IDs)
      const orderIds = newShuffledArray.map((donut) => donut.id);
      sessionStorage.setItem("donutOrder", JSON.stringify(orderIds));
    }
  }, [donuts, chompedDonuts]);

  useEffect(() => {
    sessionStorage.setItem("chompedDonuts", JSON.stringify(chompedDonuts));
  }, [chompedDonuts]);

  const handleChomp = (id: number) => {
    setChompedDonuts((prev) => [...prev, id]);
  };

  const handleReset = () => {
    setChompedDonuts([]);
  };

  const totalPrice = shuffledDonuts
    .filter((donut) => chompedDonuts.includes(donut.id))
    .reduce((sum, donut) => sum + donut.price, 0);

  if (isLoading) {
    return (
      <div className="flex container justify-center items-center h-screen">
        <Progress value={50} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">
          Failed to load donuts. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Donut List</h1>
      <div className="flex flex-row mb-4">
        {chompedDonuts.length === shuffledDonuts.length && (
          <p>
            Congratulations! You chomped all the donuts! Try resetting to enjoy
            again.
          </p>
        )}
        <Button
          className="ml-auto"
          variant="outline"
          onClick={handleReset}
          disabled={!chompedDonuts.length}
        >
          Reset
        </Button>
      </div>

      {!shuffledDonuts.length ? (
        <p className="text-center">
          No donuts available at the moment. Please check back later!
        </p>
      ) : (
        <>
          <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 text-center font-semibold border-b border-[var(--foreground-primary)] pb-2">
            <div>Image</div>
            <div>Name</div>
            <div>Price</div>
            <div className="col-span-2 lg:col-span-1">Chomp-a-donut</div>
          </div>
          {shuffledDonuts.map((donut) => (
            <div
              key={donut.id}
              className={`grid grid-cols-5 lg:grid-cols-4 gap-2 text-center items-center border-b border-[var(--foreground-primary)] py-2 ${
                chompedDonuts.includes(donut.id) ? "opacity-50" : ""
              }`}
            >
              <img
                src={`/images/${donut.imageName}.svg`}
                alt={donut.name}
                className="h-16 w-16 mx-auto"
              />
              <div>{donut.name}</div>
              <div>£{donut.price.toFixed(2)}</div>
              <Button
                className="text-xs lg:text-base col-span-2 lg:col-span-1"
                variant="outline"
                onClick={() => handleChomp(donut.id)}
                disabled={chompedDonuts.includes(donut.id)}
              >
                Chomp-a-donut
              </Button>
            </div>
          ))}
        </>
      )}
      <div className="text-right mt-4 font-bold">
        Total Price: £{totalPrice.toFixed(2)}
      </div>
    </div>
  );
}
