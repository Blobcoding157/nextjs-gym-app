import { notFound } from 'next/navigation';
import {
  addMatch,
  getBlockedUsersById,
  getUserMatchesFromDatabase,
} from '../../../../database/matches';
import { getUserByUsername, getUsers } from '../../../../database/users';
import PotentialBuddyProfile from './PotentialBuddies';

// type Props = { params: { username: string } };
export default async function PotentialBuddyPage({ params }) {
  const user = await getUserByUsername(params.username);
  // const matches = await getMatchRequestById(user.id);
  // console.log('matches on potentialBuddy component ->', matches);
  const users = await getUsers();
  const blockedUsers = await getBlockedUsersById(user.id);
  if (!user) {
    notFound();
  }

  const listOfUsersWithoutMe = users.filter((buddy) => buddy.id !== user.id);

  const mySentOrReceivedRequests = await getUserMatchesFromDatabase(user.id);

  // if (mySentOrReceivedRequests !== undefined) {
  const filteredUsers = listOfUsersWithoutMe.filter((otherUser) => {
    return !mySentOrReceivedRequests.some((match) => {
      return (
        otherUser.id === match.userPendingId ||
        otherUser.id === match.userRequestingId
      );
    });
  });

  const filteredUsersWithoutBlockedUsers = filteredUsers.filter((theUser) => {
    return !blockedUsers.some((blockedUser) => blockedUser.id === theUser.id);
  });
  // }
  const button = ({ label, user1_id, user2_id }) => {
    // : React.FC<ButtonProps>
    async function handleButtonClick() {
      const result = await addMatch(user1_id, user2_id, true, false, false);
      if (result.success) {
        console.log(result.message);
      } else {
        console.error(result.message);
      }
    }

    return <button onClick={handleButtonClick}>{label}</button>;
  };

  return (
    <PotentialBuddyProfile
      user={user}
      listOfUsersWithoutMe={filteredUsersWithoutBlockedUsers}
      blockedUsers={blockedUsers}
    />
  );
}

// OLD CODE
// const listOfUsersWithoutMe: Users = users.filter(
//   (buddy: User) => buddy.id !== user.id,
// );
// const mySentOrReceivedRequests = await getUserMatchesFromDatabase(user.id);
// for (const otherUsers in listOfUsersWithoutMe) {
//   for (const match in mySentOrReceivedRequests) {
//     if (
//       otherUsers.id === match.userPendingId ||
//       otherUsers.id === match.userRequestingId
//     ) {
//       listOfUsersWithoutMe.splice(user, 1);
//     }
//   }
// }
