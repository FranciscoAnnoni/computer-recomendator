import type { ComponentType } from "react";
import ProductivityIllustration from "./productivity";
import CreationIllustration from "./creation";
import GamingIllustration from "./gaming";
import PortabilityIllustration from "./portability";
import PowerIllustration from "./power";
import EcosystemIllustration from "./ecosystem";
import EssentialIllustration from "./essential";
import BalancedIllustration from "./balanced";
import PremiumIllustration from "./premium";
import WindowsIllustration from "./windows";
import MacosIllustration from "./macos";
import FlexibleIllustration from "./flexible";

type IllustrationProps = { width?: number; height?: number; className?: string };

export const ILLUSTRATIONS: Record<string, ComponentType<IllustrationProps>> = {
  productivity: ProductivityIllustration,
  creation: CreationIllustration,
  gaming: GamingIllustration,
  portability: PortabilityIllustration,
  power: PowerIllustration,
  ecosystem: EcosystemIllustration,
  essential: EssentialIllustration,
  balanced: BalancedIllustration,
  premium: PremiumIllustration,
  windows: WindowsIllustration,
  macos: MacosIllustration,
  flexible: FlexibleIllustration,
};
