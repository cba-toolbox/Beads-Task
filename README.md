# template-CBAT

このテンプレートには、DevContainerが用意されているので、VSCodeでRのpsyinfrパッケージを実行する環境が用意されます。

VSCodeでR Terminalを開いて、以下のRコードのname_of_repositoryをリポジトリ名に変更して実行すれば、CBATの開発環境が用意できます。


```
psyinfr::set_cbat("name_of_repository","8.2.1",use_rc=2)

```