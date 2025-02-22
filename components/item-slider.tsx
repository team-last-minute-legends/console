import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ItemSlidetProps = {
  items?: {
    url: string;
    title: string;
    image: string;
    price: number
  }[]
}
const ItemSlider = ({items = []} : ItemSlidetProps) => {
  console.log({items})
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerPage = 3;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + itemsPerPage >= items.length ? 0 : prevIndex + itemsPerPage
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - itemsPerPage < 0 ? Math.max(0, items.length - itemsPerPage) : prevIndex - itemsPerPage
    );
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      <div className="relative overflow-hidden">
        <div className="flex transition-transform duration-300 ease-in-out"
             style={{
               transform: `translateX(-${(currentIndex / items.length) * 100}%)`,
             }}>
          {items.map((item, index) => (
            <div key={index} className="w-1/3 flex-shrink-0 p-4">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <a href={item.url} className="block">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 truncate">
                      {item.title}
                    </h3>
                    <p className="text-blue-600 font-bold">
                      ${item.price}
                    </p>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button 
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ItemSlider;