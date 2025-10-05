import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';

export default function ShowSchool() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [search, setSearch] = useState('');

  const { data: session, status } = useSession();

   const fetchSchools = async (search = '') => {
    let res;
      try {
        if (search) {
          res = await fetch(`/api/schools?name=${search}`);
        } else {
res = await fetch('/api/schools');
        }
        
        
        const result = await res.json();
        if (result.success) {
          console.log("Response:: ", res)
          setSchools(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch schools:', error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchSchools();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault()
    console.log("search", search)
    const res = await fetchSchools(search);

    // console.log("Response:: ", res)

    // setSchools(res);

  }

  if (loading || status === 'loading') {
    return <p className="text-center py-10">Loading...</p>;
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md shadow-md mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-gray-700">
          School List
        </h1>
        {session?.user ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/addSchool')}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Add School
            </button>
            <button
              onClick={() => signOut()}
              className="hover:text-blue-600 py-2 px-4 rounded hover:border-blue-600 border border-gray-400"
            >
              Log Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/signin')}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        )}
      </div>

      <div className='space-y-8'>
        <form onSubmit={handleSubmit}  className='max-w-xl'>
          <input type='text' value={search} onChange={(e) => setSearch(e.target.value)}  />
          <button type='submit'>Search</button>
        </form>

      

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
    </div>
  );
}
