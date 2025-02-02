import React from "react";

interface Color {
  _id: string;
  name: string;
  hexCode: string;
}

interface ListAllColorsProps {
  colors: Color[];
  setColors: React.Dispatch<React.SetStateAction<Color[]>>;
}

const ListAllColors: React.FC<ListAllColorsProps> = ({ colors, setColors }) => {
  return (
    <div className="w-full mt-8">
      <h2 className="text-xl font-bold mb-4">All Colors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {colors.length > 0 ? (
          colors.map((color) => (
            <div key={color._id} className="bg-white shadow-md rounded-lg p-4">
              <div
                style={{ backgroundColor: color.hexCode }}
                className="w-full h-32 rounded-md mb-4"
              />
              <h3 className="text-lg font-semibold">{color.name}</h3>
              <p className="text-sm text-gray-500">{color.hexCode}</p>
            </div>
          ))
        ) : (
          <p>No colors available.</p>
        )}
      </div>
    </div>
  );
};

export default ListAllColors;
