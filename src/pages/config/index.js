import axios from 'axios';
import Error from 'next/error';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Home = () => {
  const [color, setColor] = useState('#561ecb');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [headImage, setHeadImage] = useState(null);
  const [footerImage, setFooterImage] = useState(null);
  const [headImagePreview, setHeadImagePreview] = useState(null);
  const [footerImagePreview, setFooterImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // if (process.env.NODE_ENV === 'production') {
  //   return <Error statusCode={404} />;
  // }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/getData');
        const data = response.data;

        setName(data.name);
        setPhone(data.phone);
        setColor(data.color);
        setHeadImagePreview(data.headImage ? `/${data.headImage}` : null);
        setFooterImagePreview(data.footerImage ? `/${data.footerImage}` : null);

        // Set CSS variable for the color
        document.documentElement.style.setProperty(
          '--primary-color',
          data.color
        );
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handlePhoneChange = (event) => {
    const input = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    setPhone(input);
  };

  const handleHeadImageChange = (e) => {
    const file = e.target.files[0];
    setHeadImage(file);
    setHeadImagePreview(URL.createObjectURL(file));
  };

  const handleFooterImageChange = (e) => {
    const file = e.target.files[0];
    setFooterImage(file);
    setFooterImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('color', color);
      if (headImage) {
        formData.append('headImage', headImage);
      }
      if (footerImage) {
        formData.append('footerImage', footerImage);
      }

      const response = await axios.post('/api/saveData', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage(response.data.message);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSuccessMessage('Error submitting form');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center">
      <form onSubmit={handleSubmit} className="w-full p-4 shadow-lg">
        <div className="d-flex align-items-center gap-5 justify-content-center py-3">
          <div className="d-flex flex-column gap-2">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Name"
              className="rounded-2 px-2 py-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              placeholder="Number"
              className="rounded-2 px-2 py-1"
              value={phone}
              onChange={handlePhoneChange}
              required
              onKeyDown={(e) => {
                // Allow: backspace, delete, tab, escape, enter
                if (
                  ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(
                    e.key
                  )
                ) {
                  return;
                }
                // Ensure that it is a number and stop the keypress
                if (isNaN(Number(e.key))) {
                  e.preventDefault();
                }
              }}
            />

            <label htmlFor="headImage">Upload Head Image</label>
            <input type="file" onChange={handleHeadImageChange} />
            {headImagePreview && (
              <img
                src={headImagePreview}
                alt="Head Image Preview"
                style={{ maxWidth: '200px', marginTop: '10px' }}
              />
            )}

            <label htmlFor="footerImage">Upload Footer Image</label>
            <input type="file" onChange={handleFooterImageChange} />
            {footerImagePreview && (
              <img
                src={footerImagePreview}
                alt="Footer Image Preview"
                style={{ maxWidth: '200px', marginTop: '10px' }}
              />
            )}

            <label htmlFor="color">Pick Color</label>
            <input
              type="color"
              name="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className=""
            />

            <button type="submit" className="mt-5" disabled={isLoading}>
              Submit
            </button>
            {successMessage && <p>{successMessage}</p>}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Home;

export async function getServerSideProps(context) {
  if (process.env.NODE_ENV === 'production') {
    return {
      notFound: true,
    };
  }

  return {
    props: {}, // will be passed to the page component as props
  };
}
