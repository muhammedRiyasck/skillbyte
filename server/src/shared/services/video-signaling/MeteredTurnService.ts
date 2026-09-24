import { HttpStatusCode } from '../../enums/HttpStatusCodes';
import { HttpError } from '../../types/HttpError';

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

/** Handles metered turn service functionality. */
export class MeteredTurnService {
  /**
   * Get ice servers for the MeteredTurnService entity.
   *
   * @returns The result of the operation.
   */
  getIceServers(): IceServer[] {
    const username = process.env.METERED_TURN_USERNAME;
    const credential = process.env.METERED_TURN_CREDENTIAL;

    if (!username || !credential) {
      throw new HttpError(
        'Video call relay is not configured',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    return [
      { urls: 'stun:stun.relay.metered.ca:80' },
      {
        urls: [
          'turn:global.relay.metered.ca:80',
          'turn:global.relay.metered.ca:80?transport=tcp',
          'turn:global.relay.metered.ca:443',
          'turns:global.relay.metered.ca:443?transport=tcp',
        ],
        username,
        credential,
      },
    ];
  }
}
