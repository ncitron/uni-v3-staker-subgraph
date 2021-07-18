import { Address, Bytes, ByteArray, store, log, crypto, ethereum, BigInt } from "@graphprotocol/graph-ts"
import {
  UniswapV3Staker,
  DepositTransferred,
  IncentiveCreated,
  IncentiveEnded,
  RewardClaimed,
  TokenStaked,
  TokenUnstaked,
  IncentiveCreated__Params
} from "../generated/UniswapV3Staker/UniswapV3Staker"
import { Deposit, Incentive } from "../generated/schema"

export function handleDepositTransferred(event: DepositTransferred): void {

  if (event.params.newOwner.toHexString() == "0x0000000000000000000000000000000000000000") {
    store.remove("Deposit", event.params.tokenId.toHexString())
    return
  }
  
  let deposit = Deposit.load(event.params.tokenId.toString())

  if (deposit == null) {
    deposit = new Deposit(event.params.tokenId.toString())
  }

  deposit.owner = event.params.newOwner

  deposit.save()
}

export function handleIncentiveCreated(event: IncentiveCreated): void {  
  let incentiveId = _calculateIncentiveId(event.params)
  let incentive = new Incentive(incentiveId)

  incentive.rewardToken = event.params.rewardToken
  incentive.pool = event.params.pool
  incentive.startTime = event.params.startTime.toI32()
  incentive.endTime = event.params.endTime.toI32()
  incentive.refundee = event.params.refundee
  incentive.reward = event.params.reward

  incentive.save()
}

export function handleIncentiveEnded(event: IncentiveEnded): void {
  store.remove("Incentive", event.params.incentiveId.toHexString())
}

// export function handleRewardClaimed(event: RewardClaimed): void {}

// export function handleTokenStaked(event: TokenStaked): void {}

// export function handleTokenUnstaked(event: TokenUnstaked): void {}

//
// Helper functions
//

function _calculateIncentiveId(params: IncentiveCreated__Params): string {

  // the ethereum.encode function seems to be broken in this version so we have to manually encode the ABI
  let rewardToken = _abiPad(params.rewardToken.toHexString())
  let pool = _abiPad(params.pool.toHexString())
  let startTime = _abiPad(params.startTime.toHexString())
  let endTime = _abiPad(params.endTime.toHexString())
  let refundee = _abiPad(params.refundee.toHexString())

  let abiEncoded = rewardToken + pool + startTime + endTime + refundee

  return crypto.keccak256(Bytes.fromHexString(abiEncoded)).toHexString()
}

function _abiPad(value: string): string {
  return value.slice(2).padStart(64, "0")
}
