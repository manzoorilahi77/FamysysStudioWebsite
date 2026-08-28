import type { ClientLogo } from "../../domain/social-proof/entities/ClientLogo";
import type { SocialProofRepository } from "../../domain/social-proof/repositories/SocialProofRepository";

export class GetClientLogos {
  constructor(private readonly repository: SocialProofRepository) {}

  async execute(): Promise<ReadonlyArray<ClientLogo>> {
    return this.repository.getClientLogos();
  }
}
