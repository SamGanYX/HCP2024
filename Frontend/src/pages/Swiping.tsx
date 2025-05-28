import React, { useState, useMemo, useRef, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import './Swiping.css';

// buttons
import leftButtonImg from '../assets/buttons/leftButtonImg.svg';
import rightButtonImg from '../assets/buttons/rightButtonImg.svg';
import roseIcon from '../assets/buttons/roseIcon.png';

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
    () => Array(users.length).fill(0).map(() => React.createRef<TinderCard>()),
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
      console.log(`You swiped right on ${swiped}`);
      // Send request to backend to record the swipe
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/swipe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userID, // Use the actual current user from login info
            swiped_user_id: swiped_user_id, // Use the actual current user from login info
            swipeType: direction,
          }),
        });

        const data = await response.json();
        if (data.match) {
          alert(`You matched with ${swiped}!`);
        }
      } catch (error) {
        console.error('Error sending swipe data:', error);
      }
    }
  };

  const outOfFrame = (swiped_user_id: number, idx: number): void => {
    console.log(`${swiped_user_id} (${idx}) left the screen!`, currentIndexRef.current);
    if (currentIndexRef.current >= idx) {
      childRefs[idx].current?.restoreCard();
    }
    swiped("left", swiped_user_id, idx);
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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/matchable/${userID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch matchable users');
        }
        const data = await response.json();
        setUsers(data);
        setCurrentIndex(data.length-1);
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
      <div className='cardContainer'>
        {users.map((user, index) => (
          <TinderCard
            ref={childRefs[index]}
            className='swipe'
            key={user.ID} // Use ID as the key
            onSwipe={(dir: string) => swiped(dir, user.ID, index)}
            onCardLeftScreen={() => outOfFrame(user.ID, index)}
          >
            <div style={{ backgroundImage: `url(${import.meta.env.VITE_BACKEND_URL}/uploads/photos/${user.photoPath})` }} className='card'>
              <button className="roseButton" onClick={() => console.log("Rose icon clicked!")}>
                <img src={roseIcon} alt="Rose Icon" />
              </button>

              <div className="info-section">
                <h3>{user.FullName}</h3>
                <span className="position">{user.userType}</span>
                
                <p className="description">{user.bio}</p>
                <div className="btn">  
                  <a className = "btn-text" href={`${import.meta.env.VITE_BACKEND_URL}/uploads/resumes/${user.resumePath}`}> 
                    <p className="btn-text">View Resume</p>
                  </a>
                </div>

                  {/* Tags Section */}
                  <div className="tags tags-text">
                    {user.tags}
                  </div>

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
            fontSize: '15px' }} 
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
