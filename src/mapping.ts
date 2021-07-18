import { store } from "@graphprotocol/graph-ts"
import {
  UniswapV3Staker,
  DepositTransferred,
  IncentiveCreated,
  IncentiveEnded,
  RewardClaimed,
  TokenStaked,
  TokenUnstaked
} from "../generated/UniswapV3Staker/UniswapV3Staker"
import { Deposit } from "../generated/schema"

export function handleDepositTransferred(event: DepositTransferred): void {

  if (event.params.newOwner.toHexString() === "0x0000000000000000000000000000000000000000") {
    store.remove("Deposit", event.params.tokenId.toHexString())
    return
  }

  let deposit = Deposit.load(event.params.tokenId.toHexString())

  if (deposit == null) {
    deposit = new Deposit(event.params.tokenId.toHexString())
  }

  deposit.tokenId = event.params.tokenId.toI32()
  deposit.owner = event.params.newOwner

  deposit.save()
}

// export function handleIncentiveCreated(event: IncentiveCreated): void {}

// export function handleIncentiveEnded(event: IncentiveEnded): void {}

// export function handleRewardClaimed(event: RewardClaimed): void {}

// export function handleTokenStaked(event: TokenStaked): void {}

// export function handleTokenUnstaked(event: TokenUnstaked): void {}
