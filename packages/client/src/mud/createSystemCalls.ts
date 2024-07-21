/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";
import { singletonEntity } from "@latticexyz/store-sync/recs";

import * as snarkjs from 'snarkjs';

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  /*
   * The parameter list informs TypeScript that:
   *
   * - The first parameter is expected to be a
   *   SetupNetworkResult, as defined in setupNetwork.ts
   *
   *   Out of this parameter, we only care about two fields:
   *   - worldContract (which comes from getContract, see
   *     https://github.com/latticexyz/mud/blob/main/templates/vanilla/packages/client/src/mud/setupNetwork.ts#L63-L69).
   *
   *   - waitForTransaction (which comes from syncToRecs, see
   *     https://github.com/latticexyz/mud/blob/main/templates/vanilla/packages/client/src/mud/setupNetwork.ts#L77-L83).
   *
   * - From the second parameter, which is a ClientComponent,
   *   we only care about Counter. This parameter comes to use
   *   through createClientComponents.ts, but it originates in
   *   syncToRecs
   *   (https://github.com/latticexyz/mud/blob/main/templates/vanilla/packages/client/src/mud/setupNetwork.ts#L77-L83).
   */
  { worldContract, waitForTransaction }: SetupNetworkResult,
  { Counter }: ClientComponents,
) {
  const increment = async () => {
    const { proof, publicSignals } =
    await snarkjs.groth16.fullProve( { a: 1, b: 2, c: 3, guess: document.getElementById("guess").value}, "src/zk_artifacts/proveWrong.wasm", "src/zk_artifacts/proveWrong_final.zkey");

    const vkey = await fetch("src/zk_artifacts/verification_key.json").then( function(res) {
        return res.json();
    });

    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    let pA = proof.pi_a
    pA.pop()
    let pB = proof.pi_b
    pB.pop()
    let pC = proof.pi_c
    pC.pop()

    console.log("ZK Proof:")
    console.log(proof)

    /*
     * Because IncrementSystem
     * (https://mud.dev/templates/typescript/contracts#incrementsystemsol)
     * is in the root namespace, `.increment` can be called directly
     * on the World contract.
     */
    const tx = await worldContract.write.app__increment([pA, pB, pC, publicSignals]);
    await waitForTransaction(tx);
    return getComponentValue(Counter, singletonEntity);
  };

  return {
    increment,
  };
}
