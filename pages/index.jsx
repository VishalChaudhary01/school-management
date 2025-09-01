import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ShowSchool() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch('/api/schools');
        const result = await res.json();
        if (result.success) {
          setSchools(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch schools:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  if (loading) {
    return <p className="text-center py-10">Loading schools...</p>;
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md shadow-md mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-gray-700">
          School List
        </h1>
        <button
          onClick={() => router.push('/addSchool')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Add School
        </button>
      </div>

      {schools.length === 0 ? (
        <p className="text-center">No schools found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <div
              key={school.id}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex flex-col"
            >
              {school.image && (
                <img
                  src={school.image}
                  alt={school.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              )}
              <h2 className="text-xl text-gray-800 font-semibold mb-2">
                {school.name}
              </h2>
              <p className="text-gray-700 text-sm">
                <span className="font-medium">Address: </span>
                {school.address}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-medium">City: </span>
                {school.city}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
