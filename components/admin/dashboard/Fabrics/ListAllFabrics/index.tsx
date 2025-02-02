import React from "react";

interface Fabric {
  _id: string;
  fabricName: string;
  image: {
    url: string;
    public_id: string;
  };
}

interface ListAllFabricsProps {
  fabrics: Fabric[];
  setFabrics: React.Dispatch<React.SetStateAction<Fabric[]>>;
}

const ListAllFabrics: React.FC<ListAllFabricsProps> = ({
  fabrics,
  setFabrics,
}) => {
  return (
    <div className="w-full mt-8">
      <h2 className="text-xl font-bold mb-4">All Fabrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {fabrics.length > 0 ? (
          fabrics.map((fabric) => (
            <div key={fabric._id} className="bg-white shadow-md rounded-lg p-4">
              <img
                src={fabric.image.url} // Use the 'url' field from image object
                alt={fabric.fabricName}
                className="w-full h-32 object-cover rounded-md mb-4"
              />
              <h3 className="text-lg font-semibold">{fabric.fabricName}</h3>
            </div>
          ))
        ) : (
          <p>No fabrics available.</p>
        )}
      </div>
    </div>
  );
};

export default ListAllFabrics;
