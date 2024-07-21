## Deploy guide

```bash
circom proveWrong.circom --r1cs --wasm --sym
node proveWrong_js/generate_witness.js proveWrong_js/privateKeyHasher.wasm input.json witness.wtns
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
snarkjs groth16 setup proveWrong.r1cs pot12_final.ptau proveWrong_0000.zkey
snarkjs zkey contribute proveWrong_0000.zkey proveWrong_0001.zkey --name="1st Contributor Name" -v
snarkjs zkey export verificationkey proveWrong_0001.zkey verification_key.json
snarkjs zkey export solidityverifier proveWrong_0001.zkey verifier.sol
```

```bash
forge create --rpc-url http://127.0.0.1:8545  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 verifier.sol:Groth16Verifier
```

```bash
mkdir ../packages/client/src/zk_artifacts
cp proveWrong_js/proveWrong.wasm mkdir ../packages/client/src/zk_artifacts/
cp proveWrong_0001.zkey ../packages/client/src/zk_artifacts/proveWrong_final.zkey
cp verification_key.json ../packages/client/src/zk_artifacts/
```

