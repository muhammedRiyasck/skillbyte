export interface IAccessTokenUseCase {
  execute(refreshToken: string): string;
}
