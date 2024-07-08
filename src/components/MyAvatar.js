// hooks
import useAuth from '../hooks/useAuth';
// utils
import createAvatar from '../utils/createAvatar';
//
import Avatar from './Avatar';
// Config
import { HOST_API } from '../config';
import { useSelector } from '../redux/store';

// ----------------------------------------------------------------------

export default function MyAvatar({ ...other }) {
  const { avatar, user } = useAuth();
  const { LoginUser } = useSelector((store) => store.workflow);
  const imageSrc = avatar?.url && avatar?.url !== '' ? `${HOST_API}${avatar?.url}` : '';
  // console.log(avatar.url, imageSrc, avatar);
  return (
    <Avatar
      src={imageSrc}
      alt={LoginUser?.EmpKnowAs}
      color={avatar?.url ? 'default' : createAvatar(LoginUser?.EmpKnowAs).color}
      {...other}
    >
      {createAvatar(LoginUser?.EmpKnowAs).name}
    </Avatar>
  );
}
