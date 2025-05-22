import React, { useState, useMemo, useRef, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import './Swiping.css';

// buttons
import leftButtonImg from '../assets/buttons/leftButtonImg.svg';
import rightButtonImg from '../assets/buttons/rightButtonImg.svg';
import roseIcon from '../assets/buttons/roseIcon.png';

interface TinderCardAPI {
  swipe: (dir?: string) => Promise<void>;
  restoreCard: () => Promise<void>;
}

// Updated Character interface to match the users table
interface Character {
  ID: number; // Unique identifier
  Username: string; // Username
  FullName: string; // Full name
  Email: string; // Email address
  userType: 'Project Seeker' | 'Project Owner' | 'Mentor/Advisor'; // User type
  resumePath: string; // Path to the uploaded resume
  photoPath: string; // Path to the uploaded resume
  bio: string; // Biography
  tags: string[]; // Tags associated with the user
}

const Swiping: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lastDirection, setLastDirection] = useState<string | undefined>();
  const [users, setUsers] = useState<Character[]>([]);

  const currentIndexRef = useRef<number>(currentIndex);
  const childRefs = useMemo(
    () => Array(users.length).fill(0).map(() => React.createRef<TinderCardAPI>()),
    [users.length]
  );

  const userID = localStorage.getItem("userID");

  const updateCurrentIndex = (val: number): void => {
    setCurrentIndex(val);
    console.log(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < users.length - 1;
  const canSwipe = currentIndex >= 0;

  const swiped = async (direction: string, swiped_user_id: number, index: number): Promise<void> => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);

    if (direction === 'right') {
      console.log(`You swiped right on ${swiped_user_id}`);
      // Send request to backend to record the swipe
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/swipe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: parseInt(userID || '0'), // Convert to number and handle null case
            swiped_user_id: swiped_user_id,
            swipeType: direction,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to record swipe');
        }

        const data = await response.json();
        if (data.match) {
          // Find the user's name from the users array
          const matchedUser = users.find(user => user.ID === swiped_user_id);
          if (matchedUser) {
            alert(`You matched with ${matchedUser.FullName}!`);
          } else {
            alert('You got a match!');
          }
        }
      } catch (error) {
        console.error('Error sending swipe data:', error);
      }
    }
  };

  const outOfFrame = (name: string, idx: number): void => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    if (currentIndexRef.current >= idx) {
      childRefs[idx].current?.restoreCard();
    }
  };

  const swipe = async (dir: string): Promise<void> => {
    if (canSwipe && currentIndex < users.length) {
      await childRefs[currentIndex].current?.swipe(dir);
    }
  };

  const goBack = async (): Promise<void> => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    await childRefs[newIndex].current?.restoreCard();
  };

  useEffect(() => {
    const fetchMatchableUsers = async () => {
      if (!userID) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch matchable users');
        }
        const data = await response.json();

        // Filter out the current user and format the data
        const formattedUsers = data
          .filter((user: any) => user.ID !== parseInt(userID))
          .map((user: any) => ({
            ID: user.ID,
            Username: user.Username,
            FullName: user.FullName || user.Username, // Fallback to username if FullName is null
            Email: user.Email,
            userType: user.userType,
            resumePath: user.resumePath,
            photoPath: user.photoPath || 'default-avatar.png', // Fallback to default avatar if no photo
            bio: user.bio || 'No bio available', // Fallback to default message if no bio
            tags: user.tags ? JSON.parse(user.tags) : [] // Parse tags if they exist
          }));

        setUsers(formattedUsers);
        setCurrentIndex(formattedUsers.length - 1);
      } catch (error) {
        console.error('Error fetching matchable users:', error);
      }
    };

    fetchMatchableUsers();
  }, [userID]);

  return (
    <div className="app">
      <link href='https://fonts.googleapis.com/css?family=Damion&display=swap' rel='stylesheet' />
      <link href='https://fonts.googleapis.com/css?family=Alatsi&display=swap' rel='stylesheet' />
      <h1>Find Connections</h1>
      <h2>University of Washington</h2>
      <div className='cardContainer'>
        {users.map((user, index) => (
          <TinderCard
            ref={childRefs[index]}
            className='swipe'
            key={user.ID} // Use ID as the key
            onSwipe={(dir: string) => swiped(dir, user.ID, index)}
            onCardLeftScreen={() => outOfFrame(user.FullName, index)}
          >
            <div
              style={{
                backgroundImage: `url(${import.meta.env.VITE_BACKEND_URL}/uploads/photos/${user.photoPath})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              className='card'
            >
              <button className="roseButton" onClick={() => console.log("Rose icon clicked!")}>
                <img src={roseIcon} alt="Rose Icon" />
              </button>

              <div className="info-section">
                <h3>{user.FullName}</h3>
                <span className="position">{user.userType}</span>

                <p className="description">{user.bio}</p>

                {user.tags && user.tags.length > 0 && (
                  <div className="tags">
                    {user.tags.map((tag: string, i: number) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TinderCard>
        ))}
      </div>
      <div className='buttons'>
        <button style={{
          backgroundColor: canSwipe ? '#FFFFFF' : undefined,
          border: '1px solid #D9D9D9'
        }}
          onClick={() => swipe('left')}>
          <img src={leftButtonImg} alt="Swipe Left" />
        </button>

        <button style={{
          backgroundColor: canGoBack ? '#1970FF' : undefined,
          lineHeight: '18px',
          fontSize: '15px'
        }}
          onClick={() => goBack()}>
          Undo swipe!
        </button>

        <button style={{ backgroundColor: canSwipe ? '#1BB5C6' : undefined }} onClick={() => swipe('right')}>
          <img src={rightButtonImg} alt="Swipe Right" />
        </button>
      </div>
      {lastDirection ? (
        <h2 key={lastDirection} className='infoText'>
          You swiped {lastDirection}
        </h2>
      ) : (
        <h2 className='infoText'>
          Swipe a card or press a button to get Restore Card button visible!
        </h2>
      )}
    </div>
  );
};

export default Swiping;
